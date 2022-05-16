import Prisma from '@prisma/client';

const {
    PrismaClient
} = Prisma;
const prisma = new PrismaClient();

export const getContacts = async (req, res) => {
    try {
        const contacts = await prisma.contacts.findMany();
        res.json(contacts);
    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}

export const getContact = async (req, res) => {
    try {
        const contact = await prisma.contacts.findFirst({
            where: {
                id: Number(req.params.id)
            }
        });
        res.json(contact);
    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}

export const addContact = async (req, res) => {
    const {
        name,
        email,
        phone
    } = req.body;

    if (!req.file) {
        res.status(400).json('No photograph uploaded!');
        return;
    }

    const photograph = req.file.path;

    try {
        await prisma.contacts.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                photograph: photograph
            }
        });
        res.json({
            msg: "Contact added successfully!"
        });
    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}

export const updateContact = async (req, res) => {
    const id = Number(req.params.contact_id);
    var photograph;

    const {
        name,
        email,
        phone
    } = req.body;

    try {
        await prisma.contacts.update({
            where: {
                id: id
            },
            data: {
                name: name,
                email: email,
                phone: phone
            }
        });

        if (req.file) {
            photograph = req.file.path;

            await prisma.contacts.update({
                where: {
                    id: id
                },
                data: {
                    photograph: photograph
                }
            })
        }
        res.json({
            msg: "Contact updated successfully!"
        });
    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}

export const deleteContact = async (req, res) => {
    const id = Number(req.params.contact_id);

    try {
        await prisma.contacts.delete({
            where: {
                id: id
            }
        });
        res.json({
            msg: "Contact deleted successfully!"
        });
    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}

export const favouriteContact = async (req, res) => {
    const id = Number(req.params.contact_id);
    const {
        isFavourite
    } = req.body;
    try {
        await prisma.contacts.update({
            data: {
                favourite: isFavourite
            },
            where: {
                id: id
            }
        });
        res.json({
            msg: `Contact ${isFavourite ? "added to" : "removed from"} favourites successfully!`
        });
    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}