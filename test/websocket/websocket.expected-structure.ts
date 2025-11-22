import { getTicketExpectedStructure } from '../tickets/tickets.expected-structure';

export const getCreateTicketPayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    creatorId: expect.any(String),
    timestamp: expect.any(String),
    ticket: getTicketExpectedStructure(),
  });

export const getUpdateTicketPayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    updatedBy: expect.any(String),
    timestamp: expect.any(String),
    ticket: getTicketExpectedStructure(),
  });

export const getRearrangeTicketPayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    movedBy: expect.any(String),
    timestamp: expect.any(String),
    tickets: expect.arrayOf(getTicketExpectedStructure()),
  });

export const getDeleteTicketPayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    deletedBy: expect.any(String),
    ticketId: expect.any(String),
    timestamp: expect.any(String),
  });
