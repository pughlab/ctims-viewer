import React, { useState } from 'react';
import Select, { components } from 'react-select';
import './styles.css'; // Import your CSS file for custom styles

// Define your options
const options = [
    { value: 'HeatPlot', label: 'HeatPlot' },
    { value: 'TopBarChart', label: 'TopBarChart' },
    { value: 'ReverseBarChart', label: 'ReverseBarChart' },
    { value: 'BarChart', label: 'BarChart' },
];

// Custom option component with radio buttons
const CustomOption = (props) => {
    const { innerRef, innerProps, data, isSelected } = props;

    return (
        <div
            ref={innerRef}
            {...innerProps}
            className={`custom-option ${isSelected ? 'selected' : ''}`}
        >
            <input
                type="radio"
                name="custom-radio"
                value={data.value}
                className="custom-radio"
                checked={isSelected}
                readOnly // Make it read-only to prevent changing it directly
            />
            <label>{data.label}</label>
        </div>
    );
};

const SingleSelectComponent = (props) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const handleChange = (selected) => {
        setSelectedOption(selected);
    };

    return (
        <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            components={{ Option: CustomOption }}
            isMulti={false} // If you are using `react-select`, this makes it a single-select
            placeholder="Select Item"
            closeMenuOnSelect={true} // Ensures the dropdown closes after selection
            className='fixed-width-select'
            classNamePrefix="custom" 
        />
    );
};

export default SingleSelectComponent;
