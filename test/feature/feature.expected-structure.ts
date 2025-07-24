export const getFeatureExpectedStructure = () =>
  expect.objectContaining({
    id: expect.any(String),
    title: expect.any(String),
    description: expect.any(String),
    process: expect.any(String),
    featureType: expect.any(String),
    isPublic: expect.any(Boolean),
    projectId: expect.any(String),
    ownerId: expect.any(String),
  });
