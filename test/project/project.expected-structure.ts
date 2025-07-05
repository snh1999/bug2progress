export const getLoginExpectedStructure = () => ({
  token: expect.any(String),
  message: 'Logged In successfully',
});
