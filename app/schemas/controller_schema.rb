# frozen_string_literal: true

class ControllerSchema
  SUPPORTED_TYPES = %w[bool date datetime float integer string nested].freeze

  class Field
    attr_reader :name, :type, :nested, :optional, :nullable, :included_in, :doc

    def initialize(name, type, **options)
      @name = name
      @type = type
      # nested only applies when the Field type is "nested"
      @nested = options.fetch(:nested, nil)
      @optional = options.fetch(:optional, false)
      @nullable = options.fetch(:nullable, false)
      # included_in doesn't apply when the Field type is "nested"
      @included_in = options.fetch(:included_in?, nil)&.map do |value|
        value.is_a?(Symbol) ? value.to_s : value
      end
      @doc = options.fetch(:doc, nil)
    end

    # converts this Field with a nested schema into a DSL entryon a Dry::Schema
    def register_nested(dry_dsl)
      key = register_key(dry_dsl)
      nested_schema = nested.dry_schema

      if nullable
        key.maybe { hash(nested_schema) }
      else
        key.hash(nested_schema)
      end
    end

    # convert this Field into a DSL entry on a Dry::Schema
    def register(dry_dsl)
      return register_nested(dry_dsl) if type == :nested

      key = register_key(dry_dsl)
      if nullable
        key.maybe(type, **value_options)
      else
        key.value(type, **value_options)
      end
    end

    private

    def register_key(dry_dsl)
      dry_dsl.send((optional ? "optional" : "required"), name)
    end

    def value_options
      return {} if included_in.nil?

      if nullable
        { "included_in?": included_in + [nil] }
      else
        { "included_in?": included_in }
      end
    end
  end

  class ArrayField < Field
    def register_nested(dry_dsl)
      key = register_key(dry_dsl)
      nested_schema = nested.dry_schema

      if nullable
        key.maybe { array(nested_schema) }
      else
        key.hash(nested_schema)
      end
    end

    def register(dry_dsl)
      return register_nested(dry_dsl) if type == :nested

      key = register_key(dry_dsl)
      if nullable
        # create locals so that they can be accessed within the context of the block
        dry_type = type
        array_type_options = value_options

        key.maybe { array(dry_type, **array_type_options) }
      else
        key.value(:array).each(type, **value_options)
      end
    end
  end

  class << self
    def params(&block)
      ControllerSchema.new("Params", &block)
    end

    def json(&block)
      ControllerSchema.new("JSON", &block)
    end
  end

  attr_reader :format, :fields

  def initialize(format, &block)
    @format = format
    @fields = []
    yield self if block
  end

  # mutates params by removing fields not declared in the schema, other than path params
  def remove_unknown_keys(params, in_place: true, path_params: {})
    allowed = (fields.map(&:name) + path_params.keys).map(&:to_s)
    removed = params.keys - allowed

    if in_place
      params.slice!(*allowed)
    else
      params = params.slice(*allowed)
    end

    # Recursively descend into nested params and remove unknown keys.
    fields
      .select { |field| field.type == :nested && params.include?(field.name) }
      .each do |field|
        if field.is_a? ArrayField
          nested_array_params = params[field.name].map do |value|
            field.nested.remove_unknown_keys(value, in_place: in_place)
          end

          params[field.name] = nested_array_params unless in_place
        else
          nested_params = field.nested.remove_unknown_keys(params[field.name], in_place: in_place)

          params[field.name] = nested_params unless in_place
        end
      end

    Rails.logger.info("Removed unknown keys from controller params: #{removed}") if removed.present?
    params
  end

  def validate(params)
    dry_schema.call(params.to_unsafe_h)
  end

  def dry_schema
    @dry_schema ||= begin
      dsl = Dry::Schema::DSL.new(processor_type: dry_processor)
      @fields.each { |field| field.register(dsl) }
      dsl.call
    end
  end

  private

  def method_missing(method_name, *args, **options, &nested)
    if SUPPORTED_TYPES.include?(method_name.to_s) && args.first.present?
      field_name = args.first

      # Generate a nested schema
      if method_name == :nested && nested.present?
        options[:nested] = ControllerSchema.new(format, &nested)
      end

      @fields << if options.fetch(:array, false)
                   ArrayField.new(field_name, method_name, **options)
                 else
                   Field.new(field_name, method_name, **options)
                 end
    else
      super
    end
  end

  def respond_to_missing?(method_name, include_private = false)
    SUPPORTED_TYPES.include?(method_name.to_s) || super
  end

  def dry_processor
    "Dry::Schema::#{format}".constantize
  end
end
