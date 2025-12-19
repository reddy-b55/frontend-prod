
function MegaMenu(categories, subCategories, subSubCategories, subSubSubCategories, route) {
    const response = [];
    categories.forEach((category) => {
        subCategories.forEach((subCategory) => {
            if (subCategory.maincat_id == category.id) {
                // Check if the main category already exists in the response array
                const existingCategory = response.find(cat => cat.mainCategory.id == category.id);

                // Mapping subSubCategories and subSubSubCategories
                const subCategoryData = {
                    ...subCategory,
                    subSubCategories: subSubCategories
                        .filter(subSubCat => subSubCat.submaincat_id == subCategory.id)
                        .map(subSubCat => ({
                            ...subSubCat,
                            subSubSubCategories: subSubSubCategories
                                .filter(subSubSubCat => subSubSubCat.submaincategorysub_id == subSubCat.id)
                                .map(subSubSubCat => ({
                                    ...subSubSubCat
                                }))
                        }))
                };

                if (existingCategory) {
                    // Update existing main category with new subcategory
                    existingCategory.subCategories.push(subCategoryData);
                } else {
                    // Add new main category and its subcategories
                    response.push({
                        mainCategory: category,
                        subCategories: [subCategoryData]
                    });
                }
            }
        });
    });
    return response
}

export default MegaMenu;
