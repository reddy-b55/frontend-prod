import moment from "moment";

const getIncrementNumber = (response) => {
    let incrementNumber = response.length > 40 ? Math.round(response.length / 40) : response.length;
    let incrementNumberMax = response.length > 40 ? Math.round(response.length / 40) : response.length;
    return ({
        incrementNumber: incrementNumber,
        incrementNumberMax: incrementNumberMax
    })
}

const getDates = async (start, end) => {
    console.log("start and end dates", start, end);
    const betweenDays = [];
    const startDate = moment(start);
    const endDate = moment(end);
    let currentDate = startDate.clone();
    while (currentDate.isBefore(endDate, 'day')) {
        betweenDays.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, 'days');
    }
    return betweenDays;
};

export { getIncrementNumber, getDates }