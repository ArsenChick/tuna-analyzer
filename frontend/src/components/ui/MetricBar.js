export const MetricBar = (props) => {
  const containerStyles = {
    position: "relative",
    height: "30px",
    width: "100%",
    maxWidth: "80px",
    border: "1px solid #7f7f7f",
    borderRadius: "5px",
  }

  const fillerStyles = {
    height: "100%",
    width: `${props.value * 10}%`,
    backgroundColor: "#9593d8",
    borderRadius: "inherit",
    textAlign: "right",
  }

  const labelStyles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  }

  return (
    <div style={containerStyles}>
      <div style={fillerStyles} />
      <span style={labelStyles}>{props.value}</span>
    </div>
  );
}