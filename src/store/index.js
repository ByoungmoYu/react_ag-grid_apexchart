import React, { useState, useEffect } from 'react';
import CSVReader from 'react-csv-reader';

function GetData(props) {

    const [customData, setCustomData] = useState([]);

    useEffect(() => {
        if (customData.length > 0) {
            props.getDataFromCSV(customData);
        }
    }, [customData]);

    return (
        <CSVReader onFileLoaded={(data, fileInfo) => {

            const header = data[0];
            const key = data[1];

            let arr = [header, key];

            for (let i = 2; i < data.length; i++) {
                if (data[i].length > 0) {

                    let obj = {};
                    for (let j = 0; j < data[i].length; j++) {
                        obj[key[j]] = data[i][j];
                    }
                    arr.push(obj);
                }
            }
            setCustomData(arr);
        }} />
    )
}

export default GetData;
