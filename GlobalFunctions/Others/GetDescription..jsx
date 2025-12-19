import React from 'react'

const GetDescription = (value) => {
    const htmlString = value;
    const theObj = { __html: htmlString };
    return <div dangerouslySetInnerHTML={theObj} />
}

export default GetDescription;