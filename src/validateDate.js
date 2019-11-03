import * as d3 from "d3";

const parseFormDate = (date) =>  {
    const formatTime = d3.timeFormat("%d-%m-%Y");

    const result = formatTime(date);
    return result;

}


export default parseFormDate;
