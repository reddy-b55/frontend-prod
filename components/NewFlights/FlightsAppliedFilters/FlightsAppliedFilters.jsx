// AppliedFiltersPortal.js
import React from 'react';
import { X, Star, TrendingDown, TrendingUp, Clock, Plane, PlaneTakeoff } from 'lucide-react';
import { getFlightNameMeta } from '../../../GlobalFunctions/flightsMetaFunction';
import styles from './FlightsAppliedFilters.module.css';

export default function AppliedFiltersPortal({
    filters,
    onRemoveFilter,
    onClearAllFilters,
    sortOption,
    onRemoveSortOption
}) {
    // Get the sort option display name
    const getSortOptionName = (optionId) => {
        const sortOptions = {
            'BEST': 'Best',
            'PRICE_ASC': 'Price: Low to High',
            'PRICE_DESC': 'Price: High to Low',
            'DURATION_ASC': 'Duration: Shortest',
            'DURATION_DESC': 'Longest Travel Time'
        };
        return sortOptions[optionId] || optionId;
    };

    // Get icon for sort option
    const getSortOptionIcon = (optionId) => {
        const iconMap = {
            'BEST': Star,
            'PRICE_ASC': TrendingDown,
            'PRICE_DESC': TrendingUp,
            'DURATION_ASC': Clock,
            'DURATION_DESC': Clock,
        };
        return iconMap[optionId] || Star;
    };

    // Check if any filters are applied
    const hasFilters = filters?.quickFilters?.length > 0 ||
        filters?.airlines?.length > 0 ||
        filters?.layoverAirports?.length > 0 ||
        (sortOption && sortOption !== 'BEST');

    // If no filters are applied, don't render the component
    if (!hasFilters) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>Applied Filters:</span>
                <button 
                    className={styles.clearAllButton}
                    onClick={onClearAllFilters}
                >
                    Clear All
                </button>
            </div>
            
            <div className={styles.filtersGrid}>
                {/* Sort option chip */}
                {sortOption && sortOption !== 'BEST' && (
                    <div className={styles.filterChip} onClick={() => onRemoveSortOption()}>
                        {React.createElement(getSortOptionIcon(sortOption), { 
                            size: 14, 
                            className: styles.chipIcon 
                        })}
                        <span className={styles.chipText}>{getSortOptionName(sortOption)}</span>
                        <X size={14} className={styles.closeIcon} />
                    </div>
                )}

                {/* Quick filters chips */}
                {filters?.quickFilters?.map((filter, index) => (
                    <div
                        key={`quick-${index}`}
                        className={styles.filterChip}
                        onClick={() => onRemoveFilter('quickFilters', filter)}
                    >
                        <span className={styles.chipText}>{filter}</span>
                        <X size={14} className={styles.closeIcon} />
                    </div>
                ))}

                {/* Airlines chips */}
                {filters?.airlines?.map((airline, index) => (
                    <div
                        key={`airline-${index}`}
                        className={styles.filterChip}
                        onClick={() => onRemoveFilter('airlines', airline)}
                    >
                        <Plane size={14} className={styles.chipIcon} />
                        <span className={styles.chipText}>{getFlightNameMeta(airline)}</span>
                        <X size={14} className={styles.closeIcon} />
                    </div>
                ))}

                {/* Layover airports chips */}
                {filters?.layoverAirports?.map((airport, index) => (
                    <div
                        key={`airport-${index}`}
                        className={styles.filterChip}
                        onClick={() => onRemoveFilter('layoverAirports', airport)}
                    >
                        <PlaneTakeoff size={14} className={styles.chipIcon} />
                        <span className={styles.chipText}>{airport}</span>
                        <X size={14} className={styles.closeIcon} />
                    </div>
                ))}
            </div>

           
        </div>
    );
}