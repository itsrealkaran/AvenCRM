import {prisma} from "../lib/prisma.js"

export const verifyAdmin = async (id: string) => {
    const admin = await prisma.user.findFirst({
        where: {
            id
        }
    })
    return admin ? true : false;
}

export const verifyAdminCompany = async (id: string) => {
    const company = await prisma.company.findFirst({
        where: {
            adminId: id
        }
    })
    return company ? company.id : null;
}

export const verifySuperAdmin = async (id: string) => {
    const admin = await prisma.user.findFirst({
        where: {
            id
        }
    })
    return admin ? true : false;
}