import { roundMoney } from "./format.js";

export function toMDL(amount, currency, eurToMdl) {
  if (amount == null) return 0;
  if (currency === "MDL") return roundMoney(amount);
  if (currency === "EUR") return roundMoney(amount * eurToMdl);
  throw new Error(`Unsupported currency: ${currency}`);
}

export function fromEUR(amountEUR, eurToMdl) {
  return roundMoney(amountEUR * eurToMdl);
}

export function convertInvoiceToMDL(invoiceValue, invoiceCurrency, eurToMdl) {
  if (invoiceValue == null || invoiceValue === "") return 0;
  return toMDL(Number(invoiceValue), invoiceCurrency, eurToMdl);
}
