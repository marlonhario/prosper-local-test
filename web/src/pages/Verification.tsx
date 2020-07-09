import React, { useEffect } from "react";
import { useVerificationMutation } from "../generated/graphql";
import { RouteComponentProps } from "react-router-dom";

export const Verification: React.FC<RouteComponentProps> = ({ match, history }) => {

	const [verification] = useVerificationMutation();

	// console.log(match.params);
	// const { match, history } = props;
	const { params } : any = match;
	const { token } = params;
  // console.log(params.token)
  // const [formData, setFormData] = useState({
  //   name: '',
  //   token: '',
  //   show: true,
  // });

  // useEffect(() => {
  //   const token = matchToken;
  //   const { name } = jwt.decode(token);

  //   if (token) {
  //     setFormData({ ...formData, name, token });
  //   }

  //   console.log(token, name);
  // }, [match.params]);
  // const { name, token } = formData;

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   axios
  //     .post(`${process.env.REACT_APP_API_URL}/activation`, {
  //       token,
  //     })
  //     .then((res) => {
  //       setFormData({
  //         ...formData,
  //         show: false,
  //       });

  //       history.push('/log_in');
  //       toast.success(res.data.message);
  //     })
  //     .catch((err) => {
  //       toast.error(err.response.data.errors);
  //     });
  // };
  return (
    <form
			onSubmit={async e => {
				e.preventDefault();
				const response = await verification({
					variables: {
						token
					}
				});

				console.log(response, 'daw');

			}}
    >
      <button type="submit">Activate your Account</button>
    </form>
  );
};
