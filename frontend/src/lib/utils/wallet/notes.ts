export const getTranslatedTransactionNote = (
  note: string | undefined, 
  referenceId: string | undefined, 
  t: (key: string, options?: any) => string
) => {
  if (!note) return referenceId ? t('table.viaRequest') : t('table.auto');

  if (note === "Funds locked for bidding") return t('table.notes.locked');
  if (note === "Funds unlocked (Outbid/Ended)") return t('table.notes.unlocked');
  if (note === "Payout request approved and processed.") return t('table.notes.payout');

  if (note.startsWith("Final payment for auction: ")) {
    const title = note.replace("Final payment for auction: ", "");
    return t('table.notes.payment', { title });
  }

  if (note.startsWith("Sale proceeds for auction: ")) {
    const title = note.replace("Sale proceeds for auction: ", "");
    return t('table.notes.proceeds', { title });
  }

  return note;
};
