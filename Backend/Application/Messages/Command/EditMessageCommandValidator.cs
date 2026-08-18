using FluentValidation;

namespace Application.Messages.Command
{
    public class EditMessageCommandValidator : AbstractValidator<EditMessageCommand>
    {
        public EditMessageCommandValidator()
        {
            RuleFor(x => x.MessageId)
                .NotEmpty().WithMessage("Poruka nije navedena.");

            // Bez ovoga je prazan Content brisao sadrzaj poruke umesto da ga izmeni.
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Poruka ne može biti prazna.")
                .MaximumLength(2000).WithMessage("Poruka može imati najviše 2000 karaktera.");
        }
    }
}
