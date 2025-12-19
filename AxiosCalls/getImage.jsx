import axios from "axios";

const GetImage = (data) => {

    const imgArray = new Array();

    data?.forEach(schedule => {
        const index = imgArray.indexOf(schedule?.carrier?.marketing);
        if (index === -1) {
            imgArray.push(schedule?.carrier?.marketing);
        }
    });

    // `https://onlinetools.sabretnapac.com/img/airlines/3K.png`

    return (
        <>
            {imgArray.map((image, index) => (
                <img key={index} className="mr-2" src={`https://onlinetools.sabretnapac.com/img/airlines/` + image + '.png'} style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
            ))}
        </>
    )
}



export default GetImage;