const sidebar__filters = document.querySelector(".sidebar__filters");
const sidebarToggleBtn = document.querySelector(".header__toggle-btn");
const sidebar = document.querySelector(".sidebar");

const sortBtn = document.querySelector(".header__sort-btn");
const sortOptions = document.querySelector(".header__sort-options");
const sortRadios = document.querySelectorAll('.header__sort-options input[type="radio"]');

const filterRating = document.querySelector(".sidebar__filter--rating");
const ratingCheckboxes = filterRating.querySelectorAll("input");

const clearFilterBtn = document.querySelector(".sidebar__filter--clear");
const searchInput = document.querySelector(".header__search");

const rangeValue = document.querySelector(".slider-container .price-slider");
const rangeInputValue = document.querySelectorAll(".range-input input");
const priceInputValue = document.querySelectorAll(".price-input input");

let openTabs = new Set();
let products = [];
let attributes = [];
let category = [];
let brand = [];
const MinMaxPrice = { minPrice: 0, maxPrice: 10000 };
let categoryAttribute = [];
let attributeObject = {};

let filter = {
    category: [],
    rating: [],
    brand: [],
    priceRange: [],
    inputSearch: "",
    attributes: {},

};


function sortProducts(sortBy, FilerProduct = products) {
    let sortedProducts = [...FilerProduct];

    if (sortBy === "priceAsc") {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
        sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
        sortedProducts.sort((a, b) => b.rating - a.rating);
    }

    return sortedProducts;
}

function showClearButton() {
    clearFilterBtn.removeAttribute("hidden");
}

function hideClearButton() {
    clearFilterBtn.setAttribute("hidden", "");
}

function handleRatingChange() {
    const changedValue = parseInt(event.target.value, 10);
    const isChecked = event.target.checked;

    ratingCheckboxes.forEach((checkbox) => {
        const ratingValue = parseInt(checkbox.value, 10);
        if (isChecked && ratingValue >= changedValue) {
            checkbox.checked = true;
        } else if (!isChecked && ratingValue < changedValue) {
            checkbox.checked = false;
        }
    });
}

function highlightTerm(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function RenderProduct(data , searchTerm= '') {
    let element = document.querySelector(".catalog")
    element.innerHTML = "";
    data.forEach((product) => {
        const highlightedName = highlightTerm(product.product_name, searchTerm);
        element.innerHTML += `
            <div class="product-card" product-id=${product.product_id
            } category-id=${product.category_id} brand-id=${product.brand_id}>
                <div class="product-card__image">
                    <img src="${product.image_url}" alt="Wireless Headphones">
                </div>
                <div class="product-card__content">
                    <h3 class="product-card__title">${highlightedName}</h3>
                    <div class="product-card__rating">
                        ${Array.from({ length: product.rating },(_, i) => i + 1)
                        .map(() => `<i class="fa fa-star"></i>`)
                        .join("")}
                        <span>(${product.rating})</span>
                    </div>
                    <p class="product-card__price">${product.price}</p>
                    
                </div>
                <div class="product-card__actions"> 
                    <button class="btn product-card__button" onclick=showProduct(${product.product_id})>View Product</button>
                </div>
            </div>
        `;
    });
}

sidebar__filters.addEventListener("click", function (event) {
    const target = event.target;
    const tabId = target.closest(".sidebar__filter").getAttribute("attribute-id") ? target.closest(".sidebar__filter").getAttribute("attribute-id") : undefined;

    // open sidebar category filter menu item
    if (target.closest(".sidebar__filter--heading")) {
        const heading = target.closest(".sidebar__filter--heading");
        if (heading.querySelector("i").classList.toggle("fa-chevron-down")) {
            openTabs.delete(tabId);
        } else {
            tabId && openTabs.add(parseInt(tabId, 10));
        }
        heading.closest(".sidebar__filter").querySelector("div").classList.toggle("sidebar__filter--show");
    }

    if (target.tagName === "INPUT" && target.type === "checkbox") {
        const input = target;
        const filterType = target.closest(".sidebar__filter").getAttribute("filter");
        let value = input.value;
        const isAttribute = target.closest(".category__attribute") ? true : false;

        // Update filter based on checked state
        if (input.checked) {
            if (isAttribute) {
                filter.attributes[filterType] = filter.attributes[filterType] || [];
                filter.attributes[filterType].push(value);
            } else {
                filter[filterType] = filter[filterType] || [];
                filter[filterType].push(parseInt(value, 10));
            }
            showClearButton();
        } else {
            if (isAttribute) {
                filter.attributes[filterType] = filter.attributes[filterType].filter((item) => item !== value) || [];
                if (filter.attributes[filterType].length == 0) {
                    delete filter.attributes[filterType];
                }
            } else {
                filter[filterType] = filter[filterType].filter((item) => item !== parseInt(value, 10)) || [];
            }
        }
        filterProducts();
    }
});

// toggle sidebar
sidebarToggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("active");
});

// sort menu toggle
sortBtn.addEventListener("click", function () {
    sortOptions.classList.toggle("show");
});

document.addEventListener("click", function (event) {
    if (!sortBtn.contains(event.target) && !sortOptions.contains(event.target)) {
        sortOptions.classList.remove("show");
    }
    if (sidebar.classList.contains("active") && event.target.closest("button") != sidebarToggleBtn && event.target.closest("aside") != sidebar) {
        sidebar.classList.remove("active");
    }
    
});


sortRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
        const sortBy = this.value;
        let sortProduct = sortProducts(sortBy)
        filterProducts(sortProduct)
        sortOptions.classList.remove("show");
    });
});

//side bar filter rating button
ratingCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleRatingChange);
});

clearFilterBtn.addEventListener("click", () => {
    filter = {
        category: [],
        priceRange: [MinMaxPrice.minPrice, MinMaxPrice.maxPrice],
        rating: [],
        brand: [],
        inputSearch: "",
        attributes: {},
    };

    sidebar__filters.querySelectorAll('input[type="checkbox"]').forEach((input) => (input.checked = false));
    priceInputValue[0].value = filter.priceRange[0];
    priceInputValue[1].value = filter.priceRange[1];
    rangeInputValue[0].value = filter.priceRange[0];
    rangeInputValue[1].value = filter.priceRange[1];
    rangeValue.style.left = "0%";
    rangeValue.style.right = "0%";
    hideClearButton();
    filterProducts();
});



function filterProducts(newProducts = products) {
    let filteredProducts = [...newProducts];

    if (filter.category.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
            filter.category.includes(product.category_id)
        );
    }

    if (filter.brand.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
            filter.brand.includes(product.brand_id)
        );
    }

    if (filter.rating.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
            filter.rating.includes(product.rating)
        );
    }

    if (filter.priceRange.length === 2) {
        const [minPrice, maxPrice] = filter.priceRange;
        filteredProducts = filteredProducts.filter(
            (product) => product.price >= minPrice && product.price <= maxPrice
        );
    }

    if (filter.inputSearch) {
        const searchTerm = filter.inputSearch.toLowerCase();
        filteredProducts = filteredProducts.filter((product) => product.product_name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm));
    }

    if (Object.keys(filter.attributes).length > 0) {
        filteredProducts = filteredProducts.filter((product) => {
            return Object.entries(filter.attributes).every(
                ([attributeId, values]) => {
                    return product.attributes.some(
                        (attr) =>
                            attr.attribute_id == attributeId && values.includes(attr.value)
                    );
                }
            );
        });
    }

    const sortBy = document.querySelector('.header__sort-options input[type="radio"]:checked')?.value;
    if (sortBy) {
        filteredProducts = [...sortProducts(sortBy, filteredProducts)];
    }

    updateSidebarAttributes([...products].filter((product) => filter.category.includes(product.category_id)));
    RenderProduct(filteredProducts ,filter.inputSearch.toLowerCase());
}

let priceTimeOutId;
function filterProductBasedOnPrice() {
    clearTimeout(priceTimeOutId);
    priceTimeOutId = setTimeout(() => {
        filterProducts();
    }, 2000);
}

function createAttributeLookup(attributes) {
    return attributes.reduce((lookup, attr) => {
        lookup[attr.attribute_id] = attr.attribute_name;
        return lookup;
    }, {});
}

function updateSidebarAttributes(filteredProducts) {
    const attributeValues = {};

    filteredProducts.forEach((product) => {
        product.attributes.forEach((attr) => {
            if (!attributeValues[attr.attribute_id]) {
                attributeValues[attr.attribute_id] = new Set();
            }
            attributeValues[attr.attribute_id].add(attr.value);
        });
    });

    document.querySelector(".category__attribute").innerHTML = "";

    for (const [attributeId, values] of Object.entries(attributeValues)) {
        const isOpen = openTabs.has(parseInt(attributeId));
        document.querySelector(".category__attribute").innerHTML += `
            <div class="sidebar__filter sidebar__filter--${attributeObject[attributeId]}" attribute-id=${attributeId} filter=${attributeId}>
              <h4 class="sidebar__filter--heading">${attributeObject[attributeId]} <i class="fa ${!isOpen && "fa-chevron-down"} fa-chevron-up arrow"></i></h4>
              <div class="sidebar__filter--attribute-value sidebar__filter--${attributeObject[attributeId]}-value ${isOpen ? "sidebar__filter--show" : ""}">
                ${Array.from(values)
                .map((value) => `<label><input type="checkbox" data-attribute-id="${attributeId}" value="${value}" 
                    ${filter.attributes[attributeId] && filter.attributes[attributeId].includes(value) ? "checked" : ""}> ${value}
                    </label>`
                ).join("")}
              </div>
            </div>
        
        `;
    }
}


let timerId;
searchInput.addEventListener("input", function () {
    if (timerId) {
        clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
        filter["inputSearch"] = searchInput.value.trim();
        filterProducts();
    }, 1000);
});



// Set the price gap
let priceGap = 500;

for (let i = 0; i < priceInputValue.length; i++) {
    priceInputValue[i].addEventListener("input", (e) => {
        let minp = parseInt(priceInputValue[0].value);
        let maxp = parseInt(priceInputValue[1].value);
        console.log(minp , max);
        let diff = maxp - minp;

        if (minp < 0) {
            alert("minimum price cannot be less than 0");
            priceInputValue[0].value = 0;
            minp = 0;
        }

        if (maxp > 10000) {
            alert("maximum price cannot be greater than 10000");
            priceInputValue[1].value = 10000;
            maxp = 10000;
        }

        if (minp > maxp - priceGap) {
            priceInputValue[0].value = maxp - priceGap;
            minp = maxp - priceGap;

            if (minp < 0) {
                priceInputValue[0].value = 0;
                minp = 0;
            }
        }

        if (diff >= priceGap && maxp <= rangeInputValue[1].max) {
            if (e.target.className === "min-input") {
                rangeInputValue[0].value = minp;
                filter.priceRange[0] = minp;
                let value1 = rangeInputValue[0].max;
                rangeValue.style.left = `${(minp / value1) * 100}%`;
            } else {
                rangeInputValue[1].value = maxp;
                filter.priceRange[1] = maxp;
                let value2 = rangeInputValue[1].max;
                rangeValue.style.right = `${100 - (maxp / value2) * 100}%`;
            }
            showClearButton();
            filterProductBasedOnPrice();
        }
    });

    // Add event listeners to range input elements
    for (let i = 0; i < rangeInputValue.length; i++) {
        rangeInputValue[i].addEventListener("input", (e) => {
            let minVal = parseInt(rangeInputValue[0].value);
            let maxVal = parseInt(rangeInputValue[1].value);
            let diff = maxVal - minVal;
            if (diff < priceGap) {
                if (e.target.className === "min-range") {
                    rangeInputValue[0].value = maxVal - priceGap;
                } else {
                    rangeInputValue[1].value = minVal + priceGap;
                }
            } else {
                priceInputValue[0].value = minVal;
                filter.priceRange[0] = minVal;
                priceInputValue[1].value = maxVal;
                filter.priceRange[1] = maxVal;
                console.log(minVal , rangeInputValue[0].max);
                rangeValue.style.left = `${(minVal / rangeInputValue[0].max) * 100}%`;
                rangeValue.style.right = `${100 - (maxVal / rangeInputValue[1].max) * 100}%`;
            }
            showClearButton();
            filterProductBasedOnPrice();
        });
    }
}

// modal dialog
const modal = document.querySelector(".modal");

const modalData = document.querySelector('.modal__popup')

function closeModal(){
    modal.classList.remove('modal-open')
}

function openModal(){
    modal.classList.add('modal-open')
}

function ModalProductRender(product){
    console.log(product);
    console.log(attributeObject);
    modalData.innerHTML = ''
    modalData.setAttribute('product-id', product.product_id)
    modalData.innerHTML+=`
    <h2 class="modal__popup--heading">
        <span class="modal__popup-heading-text">${product.product_name}</span>
        <i class="modal__popup-close fa fa-times"></i>
      </h2>
      <div class="modal__popup--content">
        <div class="modal__pop--content-left">
          <img src="${product.image_url}" alt="Product Image" class="modal__popup--image">
        </div>
        <div class="modal__popup--content-right">
          <h3 class="modal__popup--title">${product.product_name}</h3>
          <p class="modal__popup--description">${product.description}</p>
          <div class="modal__popup--price">Price: ${product.price}</div>
          <div class="modal__popup--rating">Rating: ${product.rating}/5</div>
          <div class="modal__popup--attributes">
            <ul class="modal__popup--attribute-list" role="list">
              ${product.attributes.map(attribute =>
                {
                    return `<li class="modal__popup--attribute-item">${attributeObject[attribute.attribute_id].padEnd(10 , " ")}: ${attribute.value}</li>`
                }).join('')}
            </ul>
          </div>  
          <div class="modal__popup--actions">
            <button class="btn modal__popup--add-to-cart">Add to Cart</button>
            <button class="btn modal__popup--buy-now">Buy Now</button>
          </div>
        </div>
      </div>
    `


    document.querySelector(".modal__popup-close").addEventListener('click', ()=>{
        closeModal();
    })
}

modal.addEventListener('click', (event)=>{
    if(!event.target.closest('.modal__popup'))
    closeModal();
})

function showProduct(productId){
    const [product] = products.filter(p => p.product_id === productId)
    openModal();
    ModalProductRender(product)
}


// setting category
function setCategory(data, element) {
    category = data;
    let categoryId = [...new Set(products.map((pro) => pro.category_id))];
    element.innerHTML = "";
    data.forEach((cat) => {
        if (categoryId.includes(cat.category_id))
            element.innerHTML += `<label><input type="checkbox" category-id=${cat.category_id} value=${cat.category_id}> ${cat.category_name}</label>`;
    });
}

function setBrand(data, element) {
    brand = data;
    let brandId = [...new Set(products.map((pro) => pro.brand_id))];
    element.innerHTML = "";
    data.forEach((brand) => {
        if (brandId.includes(brand.brand_id))
            element.innerHTML += `<label><input type="checkbox" brand-id=${brand.brand_id} value=${brand.brand_id}> ${brand.brand_name}</label>`;
    });
}

function setProduct(data, element = document.querySelector(".catalog")) {
    let minPrice = 100000000,
        maxPrice = 0;
    data.forEach((product) => {
        minPrice = Math.floor(Math.min(minPrice, product.price));
        maxPrice = Math.floor(Math.max(maxPrice, product.price));
    });

    filter.priceRange[0] = minPrice;
    filter.priceRange[1] = maxPrice;
    MinMaxPrice.minPrice = minPrice;
    MinMaxPrice.maxPrice = maxPrice;

    document.querySelectorAll(".price-input input").forEach((priceInput) => {
        priceInput.setAttribute("max", maxPrice);
        priceInput.setAttribute("min", minPrice);
    });
    document.querySelectorAll(".price-input input")[0].setAttribute("value", minPrice);
    document.querySelectorAll(".price-input input")[1].setAttribute("value", maxPrice);

    document.querySelectorAll(".range-input input").forEach((priceInput) => {
        priceInput.setAttribute("max", maxPrice);
        priceInput.setAttribute("min", minPrice);
    });
    document.querySelectorAll(".range-input input")[0].setAttribute("value", minPrice);
    document.querySelectorAll(".range-input input")[1].setAttribute("value", maxPrice);

    products = data;
    RenderProduct(data);
}

function setAttributes(data) {
    attributes = data;
    attributeObject = createAttributeLookup(attributes);
}

async function setInitFilterValue(API, element, callback) {
    element != undefined ? (element.innerHTML = "Loading...") : undefined;
    try {
        const res = await fetch(API);
        const data = await res.json();
        callback(data, element);
    } catch (error) {
        console.log(API);
        console.error(error)
    }
}

async function loadData() {
    await setInitFilterValue("Data/products.json", undefined, setProduct);
    setInitFilterValue("Data/category.json", document.querySelector(".sidebar__filter--category-value"), setCategory);
    setInitFilterValue("Data/brand.json", document.querySelector(".sidebar__filter--brand-value"), setBrand);
    setInitFilterValue("Data/attributes.json", undefined, setAttributes);
}

loadData();
