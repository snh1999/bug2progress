const postStructure = {
  id: expect.any(String),
  title: expect.any(String),
  postContent: expect.any(String),
  summary: expect.any(String),
  slug: expect.any(String),
  isPublic: expect.any(Boolean),
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
  authorId: expect.any(String),
  // organizationId: expect.any(String),
  // projectId: expect.any(String),
  // featureId: expect.any(String),
};

export const getPostExpectedStructure = () =>
  expect.objectContaining(postStructure);

export const getPostWithAuthorInfoExpectedStructure = () =>
  expect.objectContaining({
    ...postStructure,
    author: expect.objectContaining({
      joinedAt: expect.any(String),
      profile: expect.objectContaining({
        username: expect.any(String),
        name: expect.any(String),
      }),
    }),
  });
