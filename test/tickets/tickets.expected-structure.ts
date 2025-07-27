export const getTicketExpectedStructure = () =>
  expect.objectContaining({
    id: expect.any(String),
    title: expect.any(String),
    description: expect.any(String),
    createdAt: expect.any(String),
    creatorId: expect.any(String),
    position: expect.any(Number),
    ticketType: expect.any(String),
    ticketPriority: expect.any(String),
    ticketStatus: expect.any(String),
    projectId: expect.any(String),
    featureId: expect.any(String),
  });
