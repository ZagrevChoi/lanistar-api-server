import { ClientResponse } from "@sendgrid/client/src/response";
import {MailContent, MailData} from "@sendgrid/helpers/classes/mail";
import sgMail from "@sendgrid/mail";

import config from "../config";

sgMail.setApiKey(config.sendGrid.secret);

export type MailDataRequired = MailData & (
  { text: string } | { html: string } | { content: MailContent[] & { 0: MailContent } });

/**
 * asm groupId s
 * https://mc.sendgrid.com/unsubscribe-groups
 * asm: Information
 *
 * influencer-magiclink: sending magiclink to influencer him/her self during login email
 * influencer-register: sending to social@iamlanistar.com when the new influencer registered
 */

export const sendEmail = async (mailData: MailDataRequired, isMultiple = false) => {
  // const msg = {
  //   to: "test@example.com",
  //   from: "test@example.com",
  //   subject: "Sending with Twilio SendGrid is Fun",
  //   text: "and easy to do anywhere, even with Node.js",
  //   html: "<strong>and easy to do anywhere, even with Node.js</strong>"
  // };
  if (process.env.NODE_ENV === "test") {
    return [{ } as ClientResponse, {}];
  }
  return await sgMail.send({
    ...mailData
  }, isMultiple);
};

export const sendInfluencerMagiclinkEmail = async (email: string, magiclinkData: any) => {
  const subject = "New login link for the profile access";
  await sendEmail({
    from: config.sendGrid.emailAddresses.noreply,
    to: email,
    subject,
    content: [{
      type: "text/html",
      value: "text/html"
    }],
    asm: {
      groupId: config.sendGrid.unsubscribeGroups.information,
      groupsToDisplay: [config.sendGrid.unsubscribeGroups.information]
    },
    category: "influencer-magiclink",
    templateId: config.sendGrid.dynamicTemplates.influencerMagicLink,
    dynamicTemplateData: {
      ...magiclinkData,
      subject
    }
  });
};

export const sendInfluencerActivateEmail = async (mailData: any) => {
  const subject = "New Registered Influencer Info";
  await sendEmail({
    from: config.sendGrid.emailAddresses.noreply,
    to: config.env === "development" ? "orhanfirik@gmail.com" : "social@iamlanistar.com",
    subject,
    content: [{
      type: "text/html",
      value: "text/html"
    }],
    asm: {
      groupId: config.sendGrid.unsubscribeGroups.information,
      groupsToDisplay: [config.sendGrid.unsubscribeGroups.information]
    },
    category: "influencer-register",
    templateId: config.sendGrid.dynamicTemplates.influencerRegister,
    dynamicTemplateData: {
      ...mailData,
      subject
    }
  });
};

export const sendContactEmail = async (mailData: any) => {
  await sendEmail({
    from: mailData.email,
    to: config.sendGrid.emailAddresses.social,
    subject: mailData.subject,
    content: [{
      type: "text/html",
      value: "text/html"
    }],
    asm: {
      groupId: config.sendGrid.unsubscribeGroups.information,
      groupsToDisplay: [config.sendGrid.unsubscribeGroups.information]
    },
    category: "contact-form",
    templateId: config.sendGrid.dynamicTemplates.contactEmail,
    dynamicTemplateData: {
      ...mailData
    }
  });
};

export const sendInvitationToInfluencer = async (influencerEmail: string, mailData: any) => {
  await sendEmail({
    from: config.sendGrid.emailAddresses.noreply,
    to: influencerEmail,
    subject: mailData.subject,
    content: [{
      type: "text/html",
      value: "text/html"
    }],
    asm: {
      groupId: config.sendGrid.unsubscribeGroups.information,
      groupsToDisplay: [config.sendGrid.unsubscribeGroups.information]
    },
    category: "influencer-invite",
    templateId: config.sendGrid.dynamicTemplates.influencerInvite,
    dynamicTemplateData: {
      ...mailData
    }
  });
};

export default sendEmail;
