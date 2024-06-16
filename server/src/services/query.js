// Mongo recognize 0 as a way to return all of the documents
const DEFAULT_PAGE_LIMIT = 0;
const DEFAULT_PAGE_NUMBER = 1;
let orderNumber;

function getPagination(query) {
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
    const skip = (page- 1) * limit;
    const order = query.sort;

    switch(order) {
        case "desc":
            orderNumber = -1
            break
        case "asc":
            orderNumber = 1
            break
        default:
            orderNumber = 1
            break
    }

    return {
        skip,
        limit,
        orderNumber
    }
}

module.exports = {
    getPagination
}