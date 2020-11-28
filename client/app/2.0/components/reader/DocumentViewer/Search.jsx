// External Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Local Dependencies
import { formatSearchText } from 'utils/reader';
import Button from 'app/components/Button';
import SearchBar from 'app/components/SearchBar';
import { RightChevron, LeftChevron } from 'app/components/RenderFunctions';
import { LOGO_COLORS } from 'app/constants/AppConstants';

/**
 * Document Search displays the PDF Search controls
 * @param {Object} props -- Contains details about the current and previous documents
 */
export const DocumentSearch = ({
  hidden,
  searchBarRef,
  searchText,
  onKeyPress,
  prevMatch,
  nextMatch,
  searchTerm,
  totalMatchesInFile,
  matchIndex
}) => !hidden && (
  <div className={classNames('cf-search-bar', { hidden })}>
    <SearchBar
      ref={searchBarRef}
      isSearchAhead
      size="small"
      id="search-ahead"
      placeholder="Type to search..."
      onChange={(term) => searchText(term, matchIndex)}
      onKeyPress={onKeyPress}
      internalText={formatSearchText(searchTerm, totalMatchesInFile, matchIndex)}
      spinnerColor={LOGO_COLORS.READER.ACCENT}
    />
    <Button classNames={['cf-increment-search-match', 'cf-prev-match']} onClick={() => searchText(searchTerm, matchIndex - 1)} >
      <div style={{ transform: 'translateY(5px) translateX(-0.5rem)' }}>
        <LeftChevron />
        <span className="usa-sr-only">Previous Match</span>
      </div>
    </Button>
    <Button classNames={['cf-increment-search-match', 'cf-next-match']} onClick={() => searchText(searchTerm, matchIndex + 1)} >
      <div style={{ transform: 'translateY(5px) translateX(-0.5rem)' }}>
        <RightChevron />
        <span className="usa-sr-only">Next Match</span>
      </div>
    </Button>
  </div>
);

DocumentSearch.propTypes = {
  hidden: PropTypes.bool,
  searchBarRef: PropTypes.element,
  searchText: PropTypes.func,
  onKeyPress: PropTypes.func,
  searchIsLoading: PropTypes.bool,
  prevMatch: PropTypes.func,
  nextMatch: PropTypes.func,
  searchTerm: PropTypes.string,
  totalMatchesInFile: PropTypes.number,
  matchIndex: PropTypes.number,
};
