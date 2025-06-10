
import React from 'react';
import CreditApplicationForm from '../components/credit-form/CreditApplicationForm';

const PublicCreditForm = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">BOCHEL MICROCREDITO</h1>
            <p className="text-blue-600 mt-2">Solicite seu crédito de forma rápida e segura</p>
          </div>
          <CreditApplicationForm isPublicAccess={true} />
        </div>
      </div>
    </div>
  );
};

export default PublicCreditForm;
