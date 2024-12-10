import React from 'react';

const ContactPage: React.FC = () => {
    return (
        <div>
            <h1>Contact Information</h1>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <strong>José Campero</strong> 
                    <br />
                    Email: jose.campero@ucb.edu.bo
                </li>
                <li style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <strong>Alejandro Carrasco</strong> 
                    <br />
                    Email: miguel.carrasco@ucb.edu.bo
                </li>
                <li style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <strong>Oscar Campohermoso</strong>
                    <br />
                    Email: oscar.campohermoso@ucb.edu.bo
                </li>
                <li style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <strong>Fabiola Martinez</strong>
                    <br />
                    Email: fabiola.martinez@ucb.edu.bo
                </li>
                <li style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <strong>Diana Montero</strong>
                    <br />
                    Email: diana.montero.g@ucb.edu.bo
                </li>
                <li style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <strong>Gabriela Zizold</strong>
                    <br />
                    Email: gabriela.zizold@ucb.edu.bo
                </li>
            </ul>
        </div>
    );
};

export default ContactPage;