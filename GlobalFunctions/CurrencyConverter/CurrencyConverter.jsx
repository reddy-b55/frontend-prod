// const CurrencyConverter = (conversionCurrency, amount, dataSet, boolValue = false) => {
//     if (dataSet?.['rates']) {
//         let conversion = dataSet?.['rates'][conversionCurrency]
//         console.log("conversion", conversion);
//         console.log("conve chamodrsion", dataSet?.['rates']);
//         let totalPrice = Number(amount / conversion?.[0]);
//         if (totalPrice) {
//             if(boolValue == true){
//                 return dataSet?.['base'] + " " + (totalPrice).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

//             }
//             else{
//                 return dataSet?.['base'] + " " + (totalPrice).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

//             }
//         } else {
//             return dataSet?.['base'] + " " + amount;
//         }
//     } else {
//         return null
//     }
// }

// export default CurrencyConverter;


const CurrencyConverter = (conversionCurrency, amount, dataSet, boolValue = false) => {
    if (dataSet?.['rates']) {
        let conversion = dataSet?.['rates'][conversionCurrency];
        
        // Check if the conversion currency exists in the rates
        if (!conversion) {
            return dataSet?.['base'] + " " + "0.00";
        }
        
        let totalPrice = Number(amount / conversion?.[0]);
        
        if (totalPrice) {
            if (boolValue == true) {
                return dataSet?.['base'] + " " + (totalPrice).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            } else {
                return dataSet?.['base'] + " " + (totalPrice).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            }
        } else {
            return dataSet?.['base'] + " " + amount;
        }
    } else {
        return null;
    }
}

export default CurrencyConverter;