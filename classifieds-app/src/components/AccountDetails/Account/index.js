import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const Wrapper = styled.div`
  color: ${props => props.theme.mortar};
  font-size: 0.9rem;
`;

const Email = styled.div`
  color: ${props => props.theme.nero};
  font-size: 1.2rem;
  margin-top: .25rem;
`;

const Account = () => {
  const session = useSelector(state => state.session);
  return (
    <Wrapper>
      Logged in as <Email>{session.user.email}</Email>
    </Wrapper>
  );
};

export default Account;
