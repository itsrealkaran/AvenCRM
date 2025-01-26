export const fieldMatcher = {
    name(fields: any) {
        const matcher = ['fullname', 'name', 'first_name', 'full_name', 'firstname', 'name_full', 'fulname', 'ful_name', 'full name'];
        return Object.entries(fields).find(([key, value]) => matcher.includes(key.toLowerCase()))?.[0] || "";
    },
    email(fields: any) {
        const matcher = ['email', 'email_address', 'emailaddress', 'mail', 'emailid', 'email address'];
        return Object.entries(fields).find(([key, value]) => matcher.includes(key.toLowerCase()))?.[0] || "";
    },
    phone(fields: any) {
        const matcher = ['phone', 'phone_number', 'phonenumber', 'mobile', 'contact', 'contact_number', 'telephone', 'phoneno.', 'number', 'phone no.', 'phone number'];
        return Object.entries(fields).find(([key, value]) => matcher.includes(key.toLowerCase()))?.[0] || "";
    },
    leadAmount(fields: any) {
        const matcher = ['lead_amount', 'leadamount', 'amount', 'deal_value', 'dealvalue', 'value', 'deal amount', 'lead amount'];
        return Object.entries(fields).find(([key, value]) => matcher.includes(key.toLowerCase()))?.[0] || "";
    },
    budget(fields: any) {
        const matcher = ['budget', 'budget_amount', 'budgetamount', 'price_range', 'pricerange', 'price range', 'budget amount', 'budget range'];
        return Object.entries(fields).find(([key, value]) => matcher.includes(key.toLowerCase()))?.[0] || "";
    },
    location(fields: any) {
        const matcher = ['location', 'address', 'city', 'region', 'place', 'area'];
        return Object.entries(fields).find(([key, value]) => matcher.includes(key.toLowerCase()))?.[0] || "";
    },
}