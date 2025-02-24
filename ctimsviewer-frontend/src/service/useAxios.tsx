import {useState, useEffect} from "react";
import axios from "axios";

const useAxios = () => {

    useEffect(() => {
        axios.defaults.baseURL = process.env.REACT_APP_API_URL;
    }, []);

    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const operation = async(params: any) => {
        try {
            setLoading(true)
            const result = await axios.request(params);
            setResponse(result.data);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { response, error, loading, operation };
}

export default useAxios;
