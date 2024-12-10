import db from "../db/index.js"

export const verifyAdmin = async (id: string) => {
    const admin = await db.admin.findFirst({
        where: {
            id
        }
    })
    return admin ? true : false;
}

export const verifyAdminCompany = async (id: string) => {
    const company = await db.company.findFirst({
        where: {
            adminId: id
        }
    })
    return company ? company.id : null;
}

export const verifySuperAdmin = async (id: string) => {
    const admin = await db.superAdmin.findFirst({
        where: {
            id
        }
    })
    return admin ? true : false;
}