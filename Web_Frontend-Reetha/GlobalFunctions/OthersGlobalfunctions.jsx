import moment from "moment";

const generateSlug = (title) => {
    let slug = title?.toLowerCase();
    slug = slug?.replace(/\bby\b/g, '');
    slug = slug?.replace(/[()\/]/g, '');
    slug = slug?.replace(/\s+/g, '-');
    slug = slug?.replace(/[^\w-]+/g, '');
    slug = slug?.replace(/-+/g, '-');
    return slug;
}

const getOrdinalSuffix = (num) => {
    let suffix = "th";
    if (num % 100 >= 11 && num % 100 <= 13) {
        suffix = "th";
    } else {
        switch (Number(num) % 10) {
            case 1:
                suffix = "st";
                break;
            case 2:
                suffix = "nd";
                break;
            case 3:
                suffix = "rd";
                break;
        }
    }
    return `${num}${suffix}`;
};

const gettimeDifference = (value) => {
    let time = value.split('-');
    let startTime = moment(time[0], 'hh:mm')
    let endTime = moment(time[1], 'hh:mm')
    let duration = moment.duration(endTime.diff(startTime));
    let hours = parseInt(duration.asHours());
    let minutes = parseInt(duration.asMinutes()) - hours * 60;
    let hoursDisplay = ""
    if (hours > 0 && minutes === 0) {
        if (hours === 1) {
            hoursDisplay = hours + ' Hour'
        } else {
            hoursDisplay = hours + ' Hours'
        }
    } else if (hours === 0 && minutes > 0) {
        hoursDisplay = minutes + ' Mins'
    } else if (hours > 0 && minutes > 0) {
        if (hours === 1) {
            hoursDisplay = hours + " Hour " + minutes + ' Mins'
        } else {
            hoursDisplay = hours + " Hours " + minutes + ' Mins'
        }
    }
    return hoursDisplay
}



function getDistanceFromLatLon(lat1, lon1, lat2, lon2, decimalPlaces = 2) {
    // Radius of the Earth in kilometers
    console.log(lat1, lon1, lat2, lon2, "location data setttttttttt")
    const R = 6371;

    // Convert latitude and longitude from degrees to radians
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    // Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance
    const distance = R * c;

    return distance.toFixed(decimalPlaces);
}

// Helper function to convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}


const getCurrencyInCountryFormat = (baseCurrency, number) => {
    if (baseCurrency.toString() === 'USD') {
        return Number(number).toLocaleString('en-US');
    } else if (baseCurrency.toString() === 'INR') {
        return Number(number).toLocaleString('en-IN');
    } else if (baseCurrency.toString() === 'AED') {
        return Number(number).toLocaleString('ar-AE');
    } else if (baseCurrency.toString() === 'SGD') {
        return Number(number).toLocaleString('en-SG');
    } else if (baseCurrency.toString() === 'LKR') {
        return Number(number).toLocaleString('si-LK');
    } else if (baseCurrency.toString() === 'MYR') {
        return Number(number).toLocaleString('ms-MY');
    } else {
        return 'Unsupported currency';
    }
};

const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
        if (typeof window.google !== "undefined" && window.google.maps) {
            // Google Maps API already loaded
            resolve(window.google);
            return;
        }

        // Check if the script is already added to avoid duplicate loads
        const existingScript = document.getElementById("google-maps-api");
        if (existingScript) {
            existingScript.onload = () => resolve(window.google);
            existingScript.onerror = (error) => reject(error);
            return;
        }

        // Create and append the script dynamically
        const script = document.createElement("script");
        script.id = "google-maps-api";
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAJIZAqzQ12tjNY13kN3Flah4o-XNeeeDQ&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve(window.google);
        script.onerror = (error) => reject(error);

        document.head.appendChild(script);
    });
};

const getCountryFromLatLng = async (latitude, longitude) => {
    let country = '';
    await loadGoogleMapsAPI().then(async () => {
        const geocoder = new google.maps.Geocoder();
        const latLng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
        await geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results[0]) {
                const cityComponent = results[0].address_components.find(component =>
                    component.types.includes("country")
                );
                country = cityComponent.long_name
            } else {
                country = 'Something went wrong ...'
            }
        });
    });
    return country;
}

export { getOrdinalSuffix, gettimeDifference, getDistanceFromLatLon, getCurrencyInCountryFormat, generateSlug, getCountryFromLatLng }