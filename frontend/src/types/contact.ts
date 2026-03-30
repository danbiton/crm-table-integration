export interface Contact {
    id: string;
    formattedName: string;
    familyName: string;
    functionalTitle?: string;
    extensions?: {
        Z_Block?: string;
        Z_Plot?: string;
        Z_SubPlot?: string;
        Z_Is_Senior?: string;
        Z_ID_Number?: string;
        Z_Agreement_Signed?: string;
        Z_Joint_Property_Share?: string;
        Z_Signing_Date?: string;
        Z_ID_File?: string;
        Z_A3_Agreement?: string;
        Z_A3_Agreement_Single_Owner?: string;
        Z_A4_Tax_Questionnaire?: string;
        Z_D_Planning_POA?: string;
        Z_D1_Tax_POA?: string;
        Z_D2_Joint_Building_POA?: string;
        Z_D3_Transfer_Rights_POA?: string;
        Z_D4_Caution_Note_POA?: string;
        Z_D5_Legal_Proceedings_POA?: string;
        Z_D6_Bank_Inquiry_POA?: string;
        Z_G_Representation_Appointment?: string;
        Z_K_Trustee_Instructions?: string;
        Z_Caution_Note_Request?: string;
        Z_Form_7009?: string;
        Z_Form_7005?: string;
        Z_Cancel_Prev_Agreement?: string;
        Z_Agreement_Addendum?: string;
        Z_Upgrade_Downgrade_Agreement?: string;
        

    };
    attachments?: {
        fileName?: string;
    }[];
}