import db from "../db"

export const verifyAdmin = async (id: string) => {
    const admin = await db.admin.findFirst({
        where: {
            id
        }
    })
    return admin ? true : false;
}

export const verifySuperAdmin = async (id: string) => {
    const admin = await db.superAdmin.findFirst({
        where: {
            id
        }
    })
    return admin ? true : false;
}