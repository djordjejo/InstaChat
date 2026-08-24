using Application.Common;
using FluentValidation;

namespace Application.Messages.Command
{
    public class SendImageMessageCommandValidator : AbstractValidator<SendImageMessageCommand>
    {
        public SendImageMessageCommandValidator()
        {
            RuleFor(x => x.ConversationId)
                .NotEmpty().WithMessage("Razgovor nije naveden.");

            RuleFor(x => x.Content)
                .MaximumLength(2000).WithMessage("Tekst može imati najviše 2000 karaktera.");

            RuleFor(x => x.File.Content)
                .NotEmpty().WithMessage("Fajl je prazan.");

            RuleFor(x => x.File.Length)
                .LessThanOrEqualTo(ImageValidation.MaxBytes)
                .WithMessage("Slika može biti najviše 5 MB.");

            RuleFor(x => x.File.ContentType)
                .Must(ImageValidation.IsAllowedContentType)
                .WithMessage("Dozvoljene su samo slike: JPG, PNG, GIF, WEBP.");

            // Poslednja i najvaznija: sadrzaj mora da odgovara prijavljenom tipu.
            RuleFor(x => x.File)
                .Must(f => ImageValidation.IsAllowedContentType(f.ContentType) &&
                           ImageValidation.HasValidSignature(f.Content, f.ContentType))
                .WithMessage("Fajl nije ispravna slika.")
                .When(f => f.File.Content.Length > 0);
        }
    }
}
