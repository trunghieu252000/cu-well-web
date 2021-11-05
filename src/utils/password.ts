import bcrypt from 'bcryptjs';
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt();

  return await bcrypt.hash(password, salt);
}
