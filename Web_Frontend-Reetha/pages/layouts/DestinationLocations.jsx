import React from 'react';

import srilankaDes from '../../public/data/Srinalka_Destinations.json';
import singaporeDes from '../../public/data/Singapore_Destinations.json';
import malasiyaDes from '../../public/data/Malasiya_Destinations.json';

function DestinationLocations() {

    return (

        <div className='container my-5 px-5 py-4 testing-destination-cities'>

            <h6 className='m-0 p-0'>Srilanka hotels</h6>
            {
                srilankaDes.map((cityObj, index) => (
                    <div key={index}>
                        <p className='text-muted m-0 p-0 my-2'>Hotels in {Object.keys(cityObj)[0]}</p>
                    </div>
                ))
            }

            <h6 className='m-0 p-0 mt-3'>Malasiya hotels</h6>
            {
                malasiyaDes.map((cityObj, index) => (
                    <div key={index}>
                        <p className='text-muted m-0 p-0 my-2'>Hotels in {Object.keys(cityObj)[0]}</p>
                    </div>
                ))
            }

            <h6 className='m-0 p-0 mt-3'>Singapore hotels</h6>
            {
                singaporeDes.map((cityObj, index) => (
                    <div key={index}>
                        <p className='text-muted m-0 p-0 my-2'>Hotels in {Object.keys(cityObj)[0]}</p>
                    </div>
                ))
            }

            <h6 className='m-0 p-0 mt-3'>Srilanka hotels</h6>
            {
                srilankaDes.map((cityObj, index) => (
                    <div key={index}>
                        <p className='text-muted m-0 p-0 my-2'>Hotels in {Object.keys(cityObj)[0]}</p>
                    </div>
                ))
            }

            <h6 className='m-0 p-0 mt-3'>Malasiya hotels</h6>
            {
                malasiyaDes.map((cityObj, index) => (
                    <div key={index}>
                        <p className='text-muted m-0 p-0 my-2'>Hotels in {Object.keys(cityObj)[0]}</p>
                    </div>
                ))
            }

            <h6 className='m-0 p-0 mt-3'>Singapore hotels</h6>
            {
                singaporeDes.map((cityObj, index) => (
                    <div key={index}>
                        <p className='text-muted m-0 p-0 my-2'>Hotels in {Object.keys(cityObj)[0]}</p>
                    </div>
                ))
            }

        </div>

    )
    
}

export default DestinationLocations;