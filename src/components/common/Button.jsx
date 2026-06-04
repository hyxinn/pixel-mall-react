const Button = ({ className = '', variant = 'primary', block = false, ...props }) => {
  const variantClassName = {
    primary: 'pm-btn-primary',
    ghost: 'pm-btn-ghost',
    danger: 'pm-btn-danger',
    dark: 'pm-btn-dark',
    mint: 'pm-btn-mint',
    accent: 'pm-btn-accent',
  }[variant] || 'pm-btn-primary';

  const classes = ['pm-btn', variantClassName, block ? 'pm-btn-block' : '', className]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} {...props} />;
};

export default Button;
