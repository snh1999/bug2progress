import { getFeatureExpectedStructure } from '../feature/feature.expected-structure';
import { getProjectExpectedStructure } from '../project/project.expected-structure';
import { getTicketExpectedStructure } from '../tickets/tickets.expected-structure';

export const getCreateTicketPayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    createdBy: expect.any(String),
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

export const getUpdateProjectPayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    updatedBy: expect.any(String),
    timestamp: expect.any(String),
    project: getProjectExpectedStructure(),
  });

export const getDeleteProjectPayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    deletedBy: expect.any(String),
    timestamp: expect.any(String),
  });

export const getCreateFeaturePayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    createdBy: expect.any(String),
    timestamp: expect.any(String),
    feature: getFeatureExpectedStructure(),
  });

export const getUpdateFeaturePayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    updatedBy: expect.any(String),
    timestamp: expect.any(String),
    feature: getFeatureExpectedStructure(),
  });

export const getDeleteFeaturePayloadExpectedStructure = () =>
  expect.objectContaining({
    projectId: expect.any(String),
    deletedBy: expect.any(String),
    featureId: expect.any(String),
    timestamp: expect.any(String),
  });
