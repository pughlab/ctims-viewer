import React, { useState, useEffect, Children } from 'react';
import classNames from 'classnames';

interface FloatLabelProps {
  label: string;
  children: React.ReactNode;
}

const FloatLabel: React.FC<FloatLabelProps> = ({ label, children }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  // Detect if the child component is a valid form element and has value
  const detectValue = (child: React.ReactNode) => {
    if (React.isValidElement(child)) {
      const { value, onChange } = child.props;
      if (onChange) {
        // Update the value when the child changes
        setHasValue(value && value.length > 0); // For MultiSelect, it's an array of values
      }
    }
  };

  useEffect(() => {
    // Initially check if the child has a value
    Children.forEach(children, detectValue);
  }, [children]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleChildProps = (child: React.ReactNode) => {
    if (React.isValidElement(child)) {
      // Type the child as React.ReactElement with correct type for form elements
      return React.cloneElement(child as React.ReactElement<any>, {
        onFocus: handleFocus,
        onBlur: handleBlur,
      });
    }
    return child;
  };

  return (
    <div className={classNames('block relative')}>
      <div className="relative">
        {React.Children.map(children, handleChildProps)}
      </div>
      <label
        className={classNames(
          'absolute pointer-events-none left-2 top-1/2 -mt-2 leading-none transition-all ease-in-out',
          'text-xs',
          {
            '-top-3': hasValue || isFocused,
          }
        )}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatLabel;
