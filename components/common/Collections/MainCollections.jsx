import React from "react";
import Paragraph from "../Paragraph";
import TopCollection from "./TopCollection";
import { Product4 } from "../../../services/script";

const MainCollections = ({ contentData, productData }) => {

    return (
        <section>

            {
                productData?.lifestyle?.lifestyleData?.length !== 0 &&
                <>
                    <Paragraph title="title1 mt-0 mb-0 p-0 mt-lg-5 mx-3 mt-4" inner="title-inner1 mb-3 pb-2" hrClass={true} ParagraphSubTittle={contentData?.lifestyleHeading} ParagraphDesc={contentData?.lifestyleParagraph} />
                    <TopCollection noTitle="null" backImage={true} title="top collection" subtitle="" productSlider={Product4} designClass="p-t-0 mt-0 mt-lg-2 p-0" noSlider="true" cartClass="cart-info cart-wrap" data={productData?.lifestyle} />
                </>
            }

            {
                productData?.education?.educationData?.length !== 0 &&
                <>
                    <Paragraph title="title1 mt-0 mb-0 p-0 mt-lg-5 mx-3 mt-4" inner="title-inner1 mb-3 pb-2" hrClass={true} ParagraphSubTittle={contentData?.educationHeading} ParagraphDesc={contentData?.educationParagraph} />
                    <TopCollection noTitle="null" backImage={true} title="top collection" subtitle="" productSlider={Product4} designClass="p-t-0 mt-0 mt-lg-2 p-0" noSlider="true" cartClass="cart-info cart-wrap" data={productData?.education} />
                </>
            }

            {
                productData?.hotels?.hotelData?.length !== 0 &&
                <>
                    <Paragraph title="title1 mt-0 mb-0 p-0 mt-lg-5 mx-3 mt-4" inner="title-inner1 mb-3 pb-2" hrClass={true} ParagraphSubTittle={contentData?.hotelsHeading} ParagraphDesc={contentData?.hotelsParagraph} />
                    <TopCollection noTitle="null" backImage={true} title="top collection" subtitle="" productSlider={Product4} designClass="p-t-0 mt-0 mt-lg-2 p-0" noSlider="true" cartClass="cart-info cart-wrap" data={productData?.hotels} />
                </>
            }

            {
                productData?.essential?.essentialData?.length !== 0 &&
                <>
                    <Paragraph title="title1 mt-0 mb-0 p-0 mt-lg-5 mx-3 mt-4" inner="title-inner1 mb-3 pb-2" hrClass={true} ParagraphSubTittle={contentData?.essentialsHeading} ParagraphDesc={contentData?.essentialsParagraph} />
                    <TopCollection noTitle="null" backImage={true} title="top collection" subtitle="" productSlider={Product4} designClass="p-t-0 mt-0 mt-lg-2 p-0" noSlider="true" cartClass="cart-info cart-wrap" data={productData?.essential} />
                </>
            }

            {
                productData?.nonEssential?.nonessentialData?.length !== 0 &&
                <>
                    <Paragraph title="title1 mt-0 mb-0 p-0 mt-lg-5 mx-3 mt-4" inner="title-inner1 mb-3 pb-2" hrClass={true} ParagraphSubTittle={contentData?.nonEssentialsHeading} ParagraphDesc={contentData?.nonEssentialsParagraph} />
                    <TopCollection noTitle="null" backImage={true} title="top collection" subtitle="" productSlider={Product4} designClass="p-t-0 mt-0 mt-lg-2 p-0" noSlider="true" cartClass="cart-info cart-wrap" data={productData?.nonEssential} />
                </>
            }

        </section>
    );
};

export default MainCollections;