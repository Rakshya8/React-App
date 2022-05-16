import express from "express";
import {
    Register,
    Login,
    Logout
} from "../controllers/Users.js";

import {
    getContacts,
    addContact,
    updateContact,
    deleteContact,
    getContact,
    favouriteContact
} from "../controllers/Contacts.js";

import {
    verifyToken
} from "../middleware/VerifyToken.js";
import {
    refreshToken
} from "../controllers/RefreshToken.js";
import fileUploader from "../config/cloudinary.config.js";

const router = express.Router();

router.get('/contacts', verifyToken, getContacts);
router.get('/contact/:id', verifyToken, getContact);
router.post('/contacts', [verifyToken, fileUploader.single('photograph')], addContact);
router.put('/contacts/:contact_id', [verifyToken, fileUploader.single('photograph')], updateContact);
router.delete('/contacts/:contact_id', verifyToken, deleteContact);

router.put('/favourite/:contact_id', verifyToken, favouriteContact);

router.post('/signup', Register);
router.post('/signin', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);

export default router;