import StarIcon from '@mui/icons-material/Star';

const getStar = (value) => {
    let arr = [];
    for (let i = 1; i <= value; i++) {
        arr.push(<StarIcon key={i} style={{ color: "#ffbd00" , fontSize : '16px' , margin : '0px -1px' }} />);
    }
    return <>{arr}</>;
}

export default getStar;