// IntegerInput.jsx
import React, {useState} from 'react';

const isValid = (value, min, max) =>
    value !== '' &&
    value !== '-' &&
    (min === undefined || value >= min) &&
    (max === undefined || value <= max);

export const IntegerInput = ({ value, min, max, onChange }) => {
    const regexp = new RegExp(`^-?[0-9]*$`);
    const [internalValue, setInternalValue] = useState(value);
    const [valid, setValid] = useState(isValid(value, min, max));
    return (
        <input type="text"
            className={ valid ? '' : 'invalid' }
            value={ internalValue }
            onChange={ (event) => {
                const newValue = event.target.value;
                if (regexp.test(newValue)) {
                setInternalValue(newValue);
                let newValid = isValid(newValue, min, max);
                setValid(newValid);
                if (newValid) {
                    onChange(newValue);
                }
                }
            } }
            onBlur={ () => {
                if (internalValue < min) {
                setInternalValue(min);
                } else if (internalValue > max) {
                setInternalValue(max);
                } else {
                setInternalValue(value);
                }
                setValid(true);
            } }
        />
    );
};