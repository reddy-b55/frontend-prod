const ServerDown = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center animated-background" style={{ height: "100vh" }}>

            <div className="background-animation">
                <div className="box-of-star1">
                    <div className="star star-position1"></div>
                    <div className="star star-position2"></div>
                    <div className="star star-position3"></div>
                    <div className="star star-position4"></div>
                    <div className="star star-position5"></div>
                    <div className="star star-position6"></div>
                    <div className="star star-position7"></div>
                </div>
                <div className="box-of-star2">
                    <div className="star star-position1"></div>
                    <div className="star star-position2"></div>
                    <div className="star star-position3"></div>
                    <div className="star star-position4"></div>
                    <div className="star star-position5"></div>
                    <div className="star star-position6"></div>
                    <div className="star star-position7"></div>
                </div>
                <div className="box-of-star3">
                    <div className="star star-position1"></div>
                    <div className="star star-position2"></div>
                    <div className="star star-position3"></div>
                    <div className="star star-position4"></div>
                    <div className="star star-position5"></div>
                    <div className="star star-position6"></div>
                    <div className="star star-position7"></div>
                </div>
                <div className="box-of-star4">
                    <div className="star star-position1"></div>
                    <div className="star star-position2"></div>
                    <div className="star star-position3"></div>
                    <div className="star star-position4"></div>
                    <div className="star star-position5"></div>
                    <div className="star star-position6"></div>
                    <div className="star star-position7"></div>
                </div>
                <div data-js="astro" className="astronaut">
                    <div className="head"></div>
                    <div className="arm arm-left"></div>
                    <div className="arm arm-right"></div>
                    <div className="body">
                        <div className="panel"></div>
                    </div>
                    <div className="leg leg-left"></div>
                    <div className="leg leg-right"></div>
                    <div className="schoolbag"></div>
                </div>
            </div>

            <div className="d-flex flex-column align-items-center container">
                <h1>Oops !</h1>
                <h2 className="text-center">Something went wrong..</h2>
                <a href="/" className="btn btn-solid mt-4">back to home</a>
            </div>

        </div>
    )
}
export default ServerDown;