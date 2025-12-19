import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {

  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <meta property="og:title" content="Aahaas" />
          <meta property="og:description" content="Let's be real - holidays are supposed to be fun, right? But we've all been on that trip where the planning was such a pain, we almost wished we could just stay home. The back-and-forth, the endless decisions, the chaos of coordinating with everyone...it's enough to make you scream, Aaaaah!"></meta>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
          <link ref='preload' href='/assets/images/home-banner/banner1.jpg' as='image' />
          <link ref='preload' href='/assets/images/home-banner/banner2.jpg' as='image' />
          <link ref='preload' href='/assets/images/home-banner/banner3.jpg' as='image' />
          <link ref='preload' href='/assets/images/home-banner/banner4.jpg' as='image' />
          <link ref='preload' href='/assets/images/home-banner/banner5.jpg' as='image' />
          <link ref='preload' href='/assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg' as='image' />
          <link ref='preload' href='/assets/images/Bannerimages/mainbanner/hotelBanner.jpg' as='image' />
          <link ref='preload' href='/assets/images/Bannerimages/mainbanner/educationBanner.jpg' as='image' />
          <link ref='preload' href='/assets/images/Bannerimages/mainbanner/essentialBanner.jpg' as='image' />
          <link ref='preload' href='/assets/images/Bannerimages/mainbanner/nonEssentialBanner.jpg' as='image' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument;