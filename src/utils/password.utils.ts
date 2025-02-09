import * as bcrypt from 'bcrypt';

export const hashPassword = async (pass: string): Promise<string> => {
  const hashPass = await bcrypt.hash(pass, 10);
  return hashPass;
};

export const checkPassword = async (
  inPass: string,
  dbPass: string,
): Promise<boolean> => {
  console.log('a');
  const checkPass = await bcrypt.compare(inPass, dbPass);
  return checkPass;
};
