import { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import { isMatch } from "lodash"
import { GenericContext } from "../types/AppContext";

const monday = mondaySdk();

export function useAppContext():{data?: GenericContext, isLoading: boolean} {
    const [appContext, setAppContext] = useState({isLoading: true});

    useEffect(() => {
        const unsubscribe = monday.listen('context', (contextEvent) => {
            setAppContext((previousContext) =>
                isMatch(previousContext, contextEvent) ? previousContext : {isLoading: false, ...contextEvent}
            );
        })
        return () => {
            unsubscribe();
        }
    }, [])
    
    return appContext;
}