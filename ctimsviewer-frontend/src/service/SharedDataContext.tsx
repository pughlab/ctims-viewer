import React, {createContext} from 'react';

export const SharedDataContext = createContext<{
    validationResult: string;
    setValidationResult: React.Dispatch<React.SetStateAction<string>>;
}>({
    validationResult: '',
    setValidationResult: () => {}
});

export default SharedDataContext;
