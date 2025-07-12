export const getProjectExpectedStructure = () =>
  expect.objectContaining({
    id: expect.any(String),
    // urlid: expect.any(String),
    title: expect.any(String),
    summary: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    // organizationId: expect.any(String),
    status: expect.any(String),
    isPublic: expect.any(Boolean),
    basePostId: expect.any(String),
    ownerId: expect.any(String),
  });

export const getProjectContributorExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    userId: expect.any(String),
    role: expect.any(String),
  });
