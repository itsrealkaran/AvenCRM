import db from "../db"

export const verifyAdmin = async (id: string) => {
    const admin = await db.admin.findFirst({
        where: {
            id
        }
    })
    admin ? true : false;
}