import React from "react";
import DatePicker from 'react-datepicker';

import * as d3 from "d3";

import "react-datepicker/dist/react-datepicker.css";


function getDisplayName(ChartComponent) {
	const name = ChartComponent.displayName || ChartComponent.name || "ChartComponent";
	return name;
}



export default function updatingDataWrapper(ChartComponent) {
	const LENGTH = 130;

	class UpdatingComponentHOC extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				length: LENGTH,
				data: this.props.data,
				startDate:this.props.data[0].date,
				predictionDate: new Date(),
				predictionShortDate:"",
				
			}
				
			this.speed = 1000;
			this.onKeyPress = this.onKeyPress.bind(this);
		}
		componentDidMount() {
			document.addEventListener("keyup", this.onKeyPress,);
		}
		componentWillUnmount() {
			if (this.interval) clearInterval(this.interval);
			document.removeEventListener("keyup", this.onKeyPress);
		}

		getPredictionAPI(shortDate){
			const prevClose = this.state.data[this.state.length-1].close;
			//https://winvesting.org/pred?date="+shortDate+"&prev="+prevClose
			fetch("http://127.0.0.1:5000/predict?date="+ shortDate +"&prev="+ prevClose)
			.then((responseText) => {
			
				const response = responseText.json();
				
				response.then(function(responseClose){
					
					
					const predictionDate = this.state.predictionDate;
					const predictBase = this.state.data[this.state.length-1];
					const predictCompleteData = 
										{					
											date: predictionDate,
											open : predictBase.open,
											high : predictBase.high,
											low :  predictBase.low,
											close: responseClose.prediction,
											volume : predictBase.volume,
											
										}
					this.setState({
						data: this.state.data.concat(predictCompleteData),
						
					});
				}.bind(this));
				console.log(this.state.data);
			
			}
			)}

		onKeyPress(e) {
			const keyCode = e.which;
			console.log(keyCode);
			switch (keyCode) {
			case 50: {
					// 2 (50) - Start alter data
				this.func = () => {
					if (this.state.length < this.props.data.length) {
						this.setState({
							length: this.state.length + 1,
							data: this.props.data.slice(0, this.state.length + 1),
						});
					}
				};
				break;
			}
			case 80:
					// P (80)
			case 49: {
					// 1 (49) - Start Push data
				/* this.func = () => {
					if (this.state.length < this.props.data.length) { */
				this.getPredictionAPI();
		
					//}
				//};
				break;
			}
			case 27: {
					// ESC (27) - Clear interval
				this.func = null;
				if (this.interval) clearInterval(this.interval);
				break;
			}
			case 107: {
					// + (107) - increase the this.speed
				this.speed = Math.max(this.speed / 2, 50);
				break;
			}
			case 109:
			case 189: {
					// - (189, 109) - reduce the this.speed
				const delta = Math.min(this.speed, 1000);
				this.speed = this.speed + delta;
				break;
			}
			}
			if (this.func) {
				if (this.interval) clearInterval(this.interval);
				console.log("this.speed  = ", this.speed);
				this.interval = setInterval(this.func, this.speed);
			}
		}
	
		formatFormDate = (date) =>  {
			const formatTime = d3.timeFormat("%Y-%m-%d");		
			const result = formatTime(date);

			this.setState({
				predictionDate: date
			});
			this.setState({
				predictionShortDate: result
			}, () => console.log(this.state.predictionShortDate, 'predictionShortDate'));
			
			console.log(result);
		
		};

		parseFormStringDate = (date) => {
			const parseTime = d3.timeParse(("%Y-%m-%d"));
			const result = parseTime(date);
		}

		
		handleChange = (date) => {
			this.formatFormDate(date);
			
		}

		handleSubmit = (e) => {
			e.preventDefault();
			//const getDate = date.format();
			this.getPredictionAPI(this.state.predictionShortDate);
			
		}
		
		render() {
			const { type } = this.props;
			const { data } = this.state;
			//const [startDate, setStartDate] = useState(new Date());

			return (

			<div>
			<ChartComponent ref="component" data={data} type={type} />
	

			<form  onSubmit = {(e) => this.handleSubmit(e)}>

				<div className = "container">
					<h3>Date to Predict:</h3>
					
					<div className="form-group">
						
						<label>Select Date: </label>
						<DatePicker
						popperPlacement="right-start"
						popperModifiers={{
							flip: {
								behavior: ["right-start"] // don't allow it to flip to be above
							},
							preventOverflow: {
								enabled: false // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
							},
							hide: {
								enabled: false // turn off since needs preventOverflow to be enabled
							}
						}}
						shouldDisableDate={this.state.startDate}
						selected={ this.state.predictionDate }
						onChange={ this.handleChange }
						name="date"
						dateFormat="dd/MM/yyyy"
						/>
					</div>
					<input type="submit" value="Submit" />
				</div>
		
			</form>		
			</div>
			)
		}
	}
	UpdatingComponentHOC.defaultProps = {
		type: "svg",
	};
	UpdatingComponentHOC.displayName = `updatingDataWrapper(${ getDisplayName(ChartComponent) })`;

	return UpdatingComponentHOC;
}