import bcrypt from "bcryptjs";

const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(11));

export default hashPassword;
